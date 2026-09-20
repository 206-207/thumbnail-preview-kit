# Thumbnail Preview Kit

A dependency-free browser tool for inspecting thumbnail crops and titles in illustrative video layouts.

The hosted version is available at [MyThumbTester](https://mythumbtester.com/).

## Run locally
Open demo/index.html in a modern browser. Choose a local image, enter a title, select a layout, and export the preview as PNG. No build step or server is required.

## Reusable resources
- demo/: HTML, CSS and Canvas-based renderer.
- layouts.csv: canvas dimensions extracted from the P object in demo/app.js. These are implementation parameters, not research data or official YouTube dimensions.
- CHECKLIST.md: a repeatable thumbnail review worksheet.

## Input and processing
The implementation accepts JPEG, PNG, WebP and GIF files up to 10 * 1024 * 1024 bytes (MAX_BYTES in demo/app.js). FileReader reads the selected image locally. GIF is rendered as a still preview. Outputs use canvas.toBlob with image/png. The repository demo contains no third-party scripts.

## Limitations
This is not an audience A/B test, CTR predictor or pixel-accurate YouTube emulator. Views and other metadata are user-entered placeholders. Layouts may crop images differently; inspect each view. Long titles are limited to a fixed number of lines, not a perfect reproduction of YouTube truncation.

## Manual verification
Try a landscape image, a portrait image, and an over-limit file. Switch all layouts and both themes, change the title, and export a PNG. Check that the selected image is readable and that invalid files produce an error.

## License
MIT. YouTube and Google names remain the property of their owners; this project is independent.
