# v7.0.80 — Piano Roll recovery and separate Synth Forge

- Fixed initialization error: synth-control handlers now execute inside setup(), where the project state and audio engine are accessible.
- Moved Synth Forge from the Melody Roll to a dedicated tab.
- Added glowing, draggable SOS XY frequency/resonance control with keyboard support.
- Preserved bundled WAV samples, recording, EQ, and existing project formats.
- JS syntax and ZIP integrity checked. Live browser/audio testing not performed.
