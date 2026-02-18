# 🚀 GitFolio AI

**GitFolio AI** is a modern, AI-powered portfolio generator that transforms any GitHub profile into a stunning, professional showcase. By leveraging **Google Gemini AI**, it provides intelligent rationales for projects and dynamically generates high-quality thumbnails.

![GitFolio AI Preview](https://github.com/dfleston/gitfolio/raw/main/preview.png)

## ✨ Features

-   **Instant Portfolio Generation**: Simply enter a GitHub username or URL.
-   **AI Rationales**: Automatically generates deep insights and technical rationales for each repository using **Gemini 2.0 Flash**.
-   **AI Thumbnails**: Creates beautiful, context-aware thumbnails for your projects using **Gemini 2.0 Pro**.
-   **Nostr Integration**: Automatically pulls and displays your latest notes from the **Nostr** protocol.
-   **Technical Writings**: A dedicated space for long-form articles and technical documentation.
-   **Modern UI**: Built with **React 19**, **Vite**, and **Tailwind CSS** for a blazing fast, glassmorphic experience.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Lucide Icons
-   **Build Tool**: Vite 6
-   **AI Engine**: Google Gemini API (@google/genai)
-   **Social**: Nostr (nostr-tools)
-   **Styling**: Tailwind CSS (Glassmorphism & Dark Mode)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/dfleston/gitfolio.git
cd gitfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_USERNAME=your_username (optional: skip landing page)
NOSTR_NPUB=your_npub (optional)
```

### 4. Run the development server
```bash
npm run dev
```

## 📖 Configuration

-   **`GITHUB_USERNAME`**: If set, the application will bypass the search screen and load this profile automatically.
-   **`NOSTR_NPUB`**: The public key used to fetch social updates on the Nostr tab.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ⚡ by [Your Name/Handle]
