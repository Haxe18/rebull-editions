# Red Bull Energy Drink Editions

A comprehensive web application showcasing all Red Bull Energy Drink editions available worldwide, with country-specific availability and product information.

## 🌟 Features

- **Global Edition Overview**: Browse all Red Bull editions with filtering options (All, Sugarfree, Regular)
- **Country Availability**: Interactive country cards showing available editions per country
- **Product Information**: Detailed product pages with descriptions and direct links
- **Smart Image Prioritization**: Automatically selects high-quality images from preferred countries (US, UK, International)
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modal Integration**: Country-specific edition modals with 2-column layout
- **Iframe Product Pages**: View product pages without leaving the application

## 🚀 Live Page

Deploy to GitHub Pages by enabling Pages in your repository settings and selecting the main branch.

**Page URL**: `https://haxe18.github.io/rebull-editions/`

## 📁 Project Structure

```
redbull-editions-showcase/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality (multi-source data loading)
├── styles.css          # CSS styling
├── data/
│   └── redbull_editions.json  # Json with data to serve
├── .github/workflows/
│   ├── deploy.yml      # GitHub Pages deployment
│   └── sync-data.yml   # Data sync workflow (for data repo)
├── package.json        # Dependencies
└── README.md          # This file
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Flexbox and Grid
- **JavaScript (ES6+)**: Vanilla JS with async/await
- **JSON**: Data storage and management

## 📊 Data Structure

The application uses a comprehensive JSON structure with:
- **Country-based organization**: Each country has its own editions
- **Product details**: Name, flavor, description, images, URLs
- **Availability tracking**: Which countries have which editions
- **Image prioritization**: Smart selection of high-quality images

## 🎨 Key Features

### Smart Image Selection
- Prioritizes US, UK, and International images
- Falls back to first available image if preferred not found
- Ensures consistent high-quality visuals

### Interactive Country Cards
- Click to view all editions available in a country
- Shows edition count and preview tags
- Responsive grid layout

### Product Integration
- Direct links to official Red Bull product pages
- Iframe modal integration for seamless browsing
- Product descriptions and specifications

## 🔧 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Haxe18/rebull-editions.git
   cd redbull-editions
   ```

2. **Install dependencies** (if using pnpm):
   ```bash
   pnpm install
   ```

3. **Run locally**:
   - Open `index.html` in your browser, or
   - Use a local server: `python -m http.server 8000`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the **WTFPL** (Do What The F*ck You Want To Public License) - see the [LICENSE](LICENSE) file for details.

**TL;DR**: Do whatever you want with this code. Seriously. 🤷‍♂️

## 🏆 Credits

This project was developed with **Claude Sonnet 4** (Anthropic AI) in collaboration with the project owner. The entire codebase, including:

- 🎨 **Responsive UI/UX Design** - Modern, mobile-first interface
- ⚡ **Performance Optimizations** - Smart data loading with fallbacks
- 🔄 **Multi-Repository Architecture** - Automated sync workflows
- 🛠️ **Production-Ready Code** - Error handling, SEO, deployment
- 📱 **Cross-Device Compatibility** - Works on desktop and mobile
- 🎯 **Advanced Features** - Live search, modal systems, image prioritization

...was created through **pair programming** sessions, iterating on user feedback and requirements.

## 🙏 Acknowledgments

- **Red Bull** for the amazing product data and inspiration
- **GitHub** for the excellent Pages and Actions platforms
- **The open-source community** for the tools and libraries used
- **Anthropic** for providing Claude Sonnet 4 AI assistance

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

**Developed with ❤️ using AI-Human collaboration**

---

**Note**: This is a fan project and is not officially affiliated with Red Bull GmbH. 
