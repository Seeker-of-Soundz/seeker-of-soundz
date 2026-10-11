# v7.0.78 Audio playback repair

- AudioContext is now resumed and confirmed running on Play.
- Bundled WAV sample decoding no longer creates the live playback context before user interaction.
- New projects include an audible starter drum pattern (kick, snare, closed hat).
- Empty projects report that there are no notes instead of misleadingly claiming playback.
- Playback scheduler errors are shown in the status area.
- Live recording waits for playback to start.
- Fixed duplicated output-gain multiplication.
- All other site files are unchanged from v7.0.77.
