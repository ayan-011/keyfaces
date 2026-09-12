"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Profile = {
  id: string;
  name: string;
  avatar: string;
  code: string;
  audioSrc: string;
  customSegments?: [number, number][];
};

const PROFILES: Profile[] = [
  { id: "1", name: "Acp pradyuman", avatar: "/img/pradyuman.png", code: "hkb", audioSrc: "/sounds/cid.mp3" },
  { id: "2", name: "Jaadu", avatar: "/img/jaadu.png", code: "zxcbnm", audioSrc: "/sounds/jaadu2.mp3" },
  { id: "3", name: "Amma", avatar: "/img/amma.png", code: "amkbd", audioSrc: "/sounds/amma.mp3" },
  { id: "4", name: "Abhijeet", avatar: "/img/abhijeet.png", code: "ersp", audioSrc: "/sounds/abhijeet.mp3" },
  { id: "5", name: "Khan sir", avatar: "/img/khansir.png", code: "ard", audioSrc: "/sounds/khansir.mp3" },
  { id: "6", name: "Chalaja bsdk", avatar: "/img/chalaja.png", code: "cbk", audioSrc: "/sounds/chalaja.mp3" },
  { id: "7", name: "Jaldi the late", avatar: "/img/pehchan.png", code: "mfb", audioSrc: "/sounds/pehchan.mp3" },
  { id: "8", name: "Modi", avatar: "/img/modi.png", code: "bkl", audioSrc: "/sounds/modi.mp3" },
];

const FADE_S = 0.012;

type Segments = [number, number][];

type LoadState = "loading" | "ready" | "error";

type AudioQueueItem = {
profileId: string;
index: number;
};

function equalSlices(
duration: number,
count: number
): Segments {
const step = duration / count;

return Array.from(
{ length: count },
(_, i) =>
[i * step, (i + 1) * step] as [
number,
number
]
);
}

/**

* Play one section of an audio buffer.
*
* onFinished is called when the sound has completely
* finished playing.
  */
  function playSlice(
  ctx: AudioContext,
  buffer: AudioBuffer,
  [start, end]: [number, number],
  onFinished?: () => void
  ) {
  const now = ctx.currentTime;

const duration = Math.max(
end - start,
0.03
);

const source = ctx.createBufferSource();
source.buffer = buffer;

const gain = ctx.createGain();

const fade = Math.min(
FADE_S,
duration / 3
);

gain.gain.setValueAtTime(0, now);

gain.gain.linearRampToValueAtTime(
1,
now + fade
);

gain.gain.setValueAtTime(
1,
now + Math.max(
fade,
duration - fade
)
);

gain.gain.linearRampToValueAtTime(
0,
now + duration
);

source.connect(gain);
gain.connect(ctx.destination);

/**

* When this sound finishes,
* tell the queue to play the next sound.
  */
  source.onended = () => {
  onFinished?.();
  };

source.start(
now,
start,
duration
);
}

export default function Home() {
const [selectedId, setSelectedId] =
useState<string | null>(null);

const [flashId, setFlashId] =
useState<string | null>(null);

const [pulse, setPulse] =
useState(0);

const [status, setStatus] =
useState("loading voices…");

const [loadState, setLoadState] =
useState<Record<string, LoadState>>({});

/**

* Web Audio
  */
  const audioCtxRef =
  useRef<AudioContext | null>(null);

/**

* Decoded audio buffers.
  */
  const buffersRef =
  useRef<Record<string, AudioBuffer>>({});

/**

* Audio segments for every profile.
  */
  const segmentsRef =
  useRef<Record<string, Segments>>({});

/**

* Queue containing sounds waiting to play.
*
* Example:
*
* [
* { profileId: "mara", index: 0 },
* { profileId: "mara", index: 2 },
* { profileId: "mara", index: 1 }
* ]
  */
  const audioQueueRef =
  useRef<AudioQueueItem[]>([]);

/**

* Prevent multiple sounds from playing
* at the same time.
  */
  const isPlayingQueueRef =
  useRef(false);

const flashTimer =
useRef<ReturnType<typeof setTimeout> | null>(
null
);

/**

* Create / reuse AudioContext.
  */
  const getCtx = useCallback(() => {
  if (!audioCtxRef.current) {
  const Ctx =
  window.AudioContext ||
  (
  window as unknown as {
  webkitAudioContext: typeof AudioContext;
  }
  ).webkitAudioContext;

  audioCtxRef.current = new Ctx();
  }


  
if (





  audioCtxRef.current.state ===
  "suspended"
) {
  audioCtxRef.current.resume();
}

return audioCtxRef.current;



}, []);

/**

* Process the audio queue.
*
* IMPORTANT:
*
* Only ONE sound is played at a time.
*
* When the current sound finishes,
* this function starts the next one.
  */
  const processAudioQueue = useCallback(() => {
  /**

  * Something is already playing.
  * Don't start another sound.
    */
    if (isPlayingQueueRef.current) {
    return;
    }


    
/**





 * Get the next sound from the queue.
 */
const item =
  audioQueueRef.current.shift();

/**
 * Nothing left to play.
 */
if (!item) {
  return;
}

const buffer =
  buffersRef.current[
    item.profileId
  ];

const segments =
  segmentsRef.current[
    item.profileId
  ];

/**
 * Safety check.
 */
if (
  !buffer ||
  !segments ||
  !segments[item.index]
) {
  /**
   * Skip invalid item and continue
   * with the next queued sound.
   */
  processAudioQueue();
  return;
}

/**
 * Mark queue as currently playing.
 */
isPlayingQueueRef.current = true;

const ctx = getCtx();

/**
 * Play current sound.
 *
 * When it finishes, unlock the queue
 * and start the next sound.
 */
playSlice(
  ctx,
  buffer,
  segments[item.index],
  () => {
    isPlayingQueueRef.current = false;

    processAudioQueue();
  }
);



}, [getCtx]);

/**

* Load and decode all voice files.
  */
  useEffect(() => {
  const ctx = getCtx();


  
let cancelled = false;





PROFILES.forEach((profile) => {
  setLoadState((state) => ({
    ...state,
    [profile.id]: "loading",
  }));

  fetch(profile.audioSrc)
    .then((res) => {
      if (!res.ok) {
        throw new Error(
          `${res.status}`
        );
      }

      return res.arrayBuffer();
    })
    .then((arrayBuffer) => {
      return ctx.decodeAudioData(
        arrayBuffer
      );
    })
    .then((buffer) => {
      if (cancelled) {
        return;
      }

      buffersRef.current[
        profile.id
      ] = buffer;

      /**
       * Split the audio into equal pieces,
       * one piece for each character.
       */
      segmentsRef.current[
        profile.id
      ] =
        profile.customSegments ??
        equalSlices(
          buffer.duration,
          profile.code.length
        );

      setLoadState((state) => ({
        ...state,
        [profile.id]: "ready",
      }));
    })
    .catch(() => {
      if (cancelled) {
        return;
      }

      setLoadState((state) => ({
        ...state,
        [profile.id]: "error",
      }));
    });
});

return () => {
  cancelled = true;
};



}, [getCtx]);

/**

* Update loading status.
  */
  useEffect(() => {
  const allLoaded =
  PROFILES.every(
  (profile) =>
  loadState[profile.id] &&
  loadState[profile.id] !==
  "loading"
  );


  
if (!allLoaded) {





  return;
}

const anyReady =
  PROFILES.some(
    (profile) =>
      loadState[profile.id] ===
      "ready"
  );

if (anyReady) {
  setStatus(
    "select a profile"
  );
} else {
  setStatus(
    "no voice clips found — check /public/sounds"
  );
}



}, [loadState]);

/**

* Keyboard controls.
*
* IMPORTANT:
*
* Keyboard does NOTHING until
* a profile is selected.
*
* After selecting:
*
* code = "ykb"
*
* y → plays slice 0
* k → plays slice 1
* b → plays slice 2
*
* The order doesn't matter.
  */
  useEffect(() => {
  const onKeyDown = (
  e: KeyboardEvent
  ) => {
  /**

  * Ignore browser/system shortcuts.
    */
    if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey
    ) {
    return;
    }

  /**

  * Escape deselects the profile.
    */
    if (e.key === "Escape") {
    setSelectedId(null);
    setFlashId(null);

  /**
  * Clear queued sounds.
  */
  audioQueueRef.current = [];

  setStatus(
  "select a profile"
  );

  return;
  }

  /**

  * Only accept letters.
    */
    if (
    !/^[a-zA-Z]$/.test(e.key)
    ) {
    return;
    }

  /**

  * IMPORTANT:
  *
  * No profile selected =
  * no keyboard functionality.
    */
    if (!selectedId) {
    return;
    }

  const profile =
  PROFILES.find(
  (p) => p.id === selectedId
  );

  if (!profile) {
  return;
  }

  /**

  * Don't play before the audio
  * has finished loading.
    */
    if (
    loadState[profile.id] !==
    "ready"
    ) {
    return;
    }

  const letter =
  e.key.toLowerCase();

  /**

  * Find the pressed key anywhere
  * in the selected profile's code.
  *
  * Example:
  *
  * "ykb"
  *
  * y → 0
  * k → 1
  * b → 2
    */
    const index =
    profile.code.indexOf(
    letter
    );

  /**

  * Key doesn't belong to
  * this profile.
    */
    if (index === -1) {
    return;
    }

  /**

  * Add this sound to the queue.
  *
  * It will NOT necessarily play
  * immediately.
  *
  * If another sound is playing,
  * it waits for that sound to finish.
    */
    audioQueueRef.current.push({
    profileId: profile.id,
    index,
    });

  /**

  * Start processing the queue.
  *
  * If something is already playing,
  * processAudioQueue() simply returns.
    */
    processAudioQueue();

  /**

  * Visual feedback.
    */
    setPulse(
    (value) => value + 1
    );

  setFlashId(
  profile.id
  );

  if (flashTimer.current) {
  clearTimeout(
  flashTimer.current
  );
  }

  flashTimer.current =
  setTimeout(() => {
  setFlashId(null);
  }, 150);

  setStatus(
  `${profile.name} — "${letter}"`
  );
  };


  
window.addEventListener(





  "keydown",
  onKeyDown
);

return () => {
  window.removeEventListener(
    "keydown",
    onKeyDown
  );
};



}, [
selectedId,
loadState,
processAudioQueue,
]);

/**

* Select profile.
*
* Selecting does NOT play audio.
  */
  const handleClick = (
  profile: Profile
  ) => {
  /**

  * Clear any sounds belonging to
  * the previously selected profile.
    */
    audioQueueRef.current = [];


    
setSelectedId(





  profile.id
);

setStatus(
  `${profile.name}'s code is ${profile.code} — press any key`
);



};

return ( <main className="min-h-screen bg-graphite-900 text-bone-100 flex flex-col"> <div className="flex-1 px-6 pt-16 pb-32 md:px-12 md:pt-20 max-w-5xl mx-auto w-full"> <header className="mb-14 max-w-xl"> <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-bone-100">
Keyfaces </h1>



      <p className="mt-4 text-bone-500 text-lg leading-relaxed">
        Click a face to select it
        and see its code. Then
        press any key from that
        code to hear its sound.
      </p>
    </header>
 

    <section
      aria-label="Profiles"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-14"
    >
      {PROFILES.map(
        (profile) => {
          const isSelected =
            selectedId ===
            profile.id;

          const isFlashing =
            flashId ===
            profile.id;

          /**
           * Only the selected
           * profile shows its code.
           */
          const showLetters =
            isSelected;

          return (
            <div
              key={profile.id}
              className="relative flex flex-col items-center"
            >
              {showLetters && (
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex gap-1">
                  {profile.code
                    .split("")
                    .map(
                      (
                        ch,
                        index
                      ) => (
                        <span
                          key={`${profile.id}-${index}-${pulse}`}
                          className={[
                            "w-6 h-6 rounded-md border",
                            "text-xs font-mono font-semibold",
                            "flex items-center justify-center",
                            "bg-graphite-800",
                            "border-amber-500",
                            "text-amber-400",
                          ].join(
                            " "
                          )}
                        >
                          {ch}
                        </span>
                      )
                    )}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  handleClick(
                    profile
                  )
                }
                aria-pressed={
                  isSelected
                }
                aria-label={`Select ${profile.name}. Shortcut: ${profile.code}`}
                className={[
                  "group relative w-24 h-24 md:w-28 md:h-28",
                  "rounded-full p-1.5 bg-graphite-700",
                  "shadow-keycap transition-transform duration-150",
                  "focus-ring",
                  "hover:-translate-y-0.5",
                  "active:translate-y-1 active:shadow-keycapPressed",
                  isSelected
                    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-graphite-900"
                    : "",
                  isFlashing
                    ? "animate-press shadow-glow"
                    : "",
                ].join(
                  " "
                )}
              >
                <span className="block w-full h-full rounded-full overflow-hidden bg-graphite-600">
                 <Image
  src={profile.avatar}
  alt={profile.name}
 width={ 112 } height={ 112 }
  className="rounded-full w-full h-full  object-cover"
/>
                </span>
              </button>

              <span
                className={[
                  "mt-3 text-sm",
                  isSelected
                    ? "text-amber-400 font-semibold"
                    : "text-bone-300",
                ].join(
                  " "
                )}
              >
                {
                  profile.name
                }

                {loadState[
                  profile.id
                ] ===
                  "error" && (
                  <span className="block text-xs text-bone-500 font-normal">
                    clip missing
                  </span>
                )}
              </span>
            </div>
          );
        }
      )}
    </section>
  </div>

  <footer className="fixed bottom-0 inset-x-0 border-t border-graphite-700 bg-graphite-950/95 backdrop-blur">
    <div className="max-w-5xl mx-auto w-full px-6 md:px-12 py-4">
      <p className="text-bone-500 text-sm font-mono truncate">
        {status}
      </p>
    </div>
  </footer>
</main>



);
}
