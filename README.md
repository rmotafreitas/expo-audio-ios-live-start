# expo-audio iOS live-start repro

Minimal reproduction for: **`play()` on a remote/live stream on iOS does not start playback
promptly, and there is no supported way to opt out of `AVPlayer`'s wait-to-minimize-stalling
behavior.**

## Run

```sh
npm install
npx expo run:ios
```

(An iOS development build is required — this is `expo-audio` native behavior.)

## What the app does

`App.js` creates an audio player for a public live stream and calls `player.play()` immediately,
before the underlying `AVPlayerItem` has reached `readyToPlay`. It then shows the live
`AudioStatus` and the wall-clock time between the `play()` call and the first moment
`status.playing` becomes `true`.

## Observed (iOS)

After calling `play()`:

- `timeControlStatus` sits at `waitingToPlay` and `reasonForWaitingToPlay` is
  `toMinimizeStalls` while the player buffers, and
- the measured time from `play()` to actual playback is noticeably longer than the stream's
  real time-to-first-audio.

`AVPlayer.automaticallyWaitsToMinimizeStalling` defaults to `true`, and `expo-audio` neither
lets you turn it off nor re-applies it after the item changes.

## Expected

For live/remote playback, a host should be able to request a low-latency start instead of
waiting for `AVPlayer` to fill its buffer, e.g. by opting out of
`automaticallyWaitsToMinimizeStalling` (or by exposing the flag on `AudioPlayerOptions`).

## Notes

- The "create a player, then immediately `play()` before it is ready" half of this is addressed
  by https://github.com/expo/expo/pull/50467; this repro isolates the stalling/wait half.
- Seen on iOS 18/26 simulators and devices with `expo-audio` 57.0.5 and 58.0.1.
