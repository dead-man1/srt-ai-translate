# Check the latest version at [subtitle-translate](https://github.com/itsyebekhe/subtitle-translate/); since this version will not receive updates anymore!

# SRT Translator to Persian (Farsi) using Gemini API

This is a Cloudflare Worker script that translates SRT (SubRip Subtitle) files to Persian (Farsi) using the Google Gemini API. Users can upload an SRT file and provide their Gemini API key to get a translated version of the subtitles.

## Features

- **Upload SRT Files**: Users can upload `.srt` files for translation.
- **Gemini API Integration**: Translates text to Persian using the Google Gemini API.
- **Download Translated SRT**: The translated SRT file is provided as a downloadable attachment.
- **User-Friendly Interface**: A clean and responsive HTML form for file upload and API key input.
- **API Key Security**: Option to toggle API key visibility and save it locally (optional).

## How It Works

1. The user uploads an SRT file and provides their Gemini API key.
2. The worker parses the SRT file into individual subtitle entries.
3. Each subtitle text is sent to the Gemini API for translation.
4. The translated subtitles are reconstructed into a new SRT file.
5. The translated SRT file is returned as a downloadable file.

## Prerequisites

- A **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/).
- A Cloudflare account with access to Cloudflare Workers.

## Setup

1. **Deploy to Cloudflare Workers**:
   - Copy the script into a new Cloudflare Worker.
   - Deploy the worker.

3. **Access the Translator**:
   - Open the worker's URL in your browser.
   - Upload an SRT file and provide your Gemini API key.

## Usage

1. Open the worker's URL in your browser.
2. Upload an SRT file using the file input.
3. Enter your Gemini API key.
4. Click "Translate to Persian".
5. Download the translated SRT file.

## Example

### Input SRT File
```
1
00:00:01,000 --> 00:00:03,000
Hello, world!

2
00:00:04,000 --> 00:00:06,000
This is a test subtitle.
```

### Translated SRT File
```
1
00:00:01,000 --> 00:00:03,000
سلام، دنیا!

2
00:00:04,000 --> 00:00:06,000
این یک زیرنویس آزمایشی است.
```

## Code Structure

- **`handleRequest`**: Main request handler for the worker.
- **`htmlForm`**: Generates the HTML form for file upload and API key input.
- **`parseSRT`**: Parses the SRT file content into individual entries.
- **`translateText`**: Sends text to the Gemini API for translation.
- **`reconstructSRT`**: Reconstructs the translated entries into an SRT file.

## Customization

- **API Key Security**: If you want to enforce stricter security, consider using Cloudflare's environment variables (`env`) to store the API key instead of asking users to input it.
- **Styling**: Modify the CSS in the `htmlForm` function to customize the appearance of the form.

## Limitations

- **API Key Exposure**: The API key is sent as part of the form data. Ensure the worker is deployed over HTTPS to secure the transmission.
- **Rate Limits**: The Gemini API has usage limits. Ensure your usage stays within the allowed limits.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Note**: This project is not affiliated with Google or Cloudflare. Use the Gemini API in compliance with Google's terms of service.
