# FlowLink Landing Website

A modern, responsive landing website for FlowLink WiFi Solutions built with Next.js 15 and Tailwind CSS.

## Features

- **Responsive Design**: Fully responsive across all devices
- **Dark/Light Theme**: Automatic theme switching with user preference
- **Modern UI**: Clean, professional design with smooth animations
- **Contact Form**: Integrated contact form that sends queries to the dashboard
- **Dynamic Pricing**: Fetches payment plans from the backend API
- **SEO Optimized**: Proper meta tags and structured data
- **Performance**: Optimized for fast loading and smooth interactions

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **TypeScript**: Full TypeScript support
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 5510

### Installation

1. Navigate to the landing website directory:
```bash
cd landing-website
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Update environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5510
```

5. Start the development server:
```bash
npm run dev
```

The landing website will be available at `http://localhost:3001`

## Project Structure

```
landing-website/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/
│   │   ├── landing/            # Landing page components
│   │   │   ├── header.tsx      # Navigation header
│   │   │   ├── hero.tsx        # Hero section
│   │   │   ├── features.tsx    # Features section
│   │   │   ├── pricing.tsx     # Pricing plans
│   │   │   ├── about.tsx       # About section
│   │   │   ├── contact.tsx     # Contact form
│   │   │   ├── footer.tsx      # Footer
│   │   │   └── landing-page.tsx # Main component
│   │   └── ui/                 # Reusable UI components
│   ├── contexts/               # React contexts
│   │   └── theme-context.tsx   # Theme management
│   └── lib/                    # Utilities
│       ├── api.ts              # API client
│       └── utils.ts            # Helper functions
├── public/                     # Static assets
├── tailwind.config.js          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json                # Dependencies
```

## Sections

### 1. Hero Section
- Eye-catching headline with gradient text
- Call-to-action buttons
- Animated background elements
- Feature highlights

### 2. Features Section
- Service highlights with icons
- Technology showcase
- Statistics and achievements
- Interactive elements

### 3. Pricing Section
- Dynamic pricing plans from API
- Popular plan highlighting
- Feature comparisons
- Call-to-action buttons

### 4. About Section
- Company story and mission
- Team showcase
- Core values
- Statistics and achievements

### 5. Contact Section
- Contact form with validation
- Contact information
- Business hours
- Location details

### 6. Footer
- Company information
- Quick links
- Social media links
- Newsletter signup

## API Integration

The landing website integrates with the backend API for:

- **Contact Form**: Submits queries to `/contact-queries` endpoint
- **Pricing Plans**: Fetches plans from `/payment-plans/public` endpoint

## Theme System

The website uses a comprehensive theme system that matches the dashboard:

- **CSS Variables**: Consistent color scheme
- **Dark/Light Mode**: Automatic switching
- **Smooth Transitions**: All theme changes are animated
- **Responsive**: Optimized for all screen sizes

## Customization

### Colors
Update the color scheme in `src/app/globals.css`:

```css
:root {
  --color-primary: 221.2 83.2% 53.3%;
  --color-secondary: 210 40% 96%;
  /* ... other colors */
}
```

### Content
Update content in the respective component files:
- Company information in `about.tsx`
- Contact details in `contact.tsx` and `footer.tsx`
- Feature descriptions in `features.tsx`

### Styling
Modify Tailwind classes or add custom CSS in `globals.css`

## Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

For production, ensure these environment variables are set:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

## Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting by Next.js
- **CSS Optimization**: Tailwind CSS purging
- **Bundle Analysis**: Use `npm run analyze` to analyze bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary and confidential.