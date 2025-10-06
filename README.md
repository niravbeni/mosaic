# IDEO Mosaic - Strength Visualization

A Next.js application for visualizing IDEO's strengths by sector (categories) and offers. This tool parses CSV data of deals, calculates strength indices, and presents insights through interactive radar charts, ranked lists, and heatmaps.

## Features

### 📊 Data Management
- **Pre-loaded Sample Data**: Sample dataset loads automatically on first visit
- **CSV Upload**: Parse and validate deal data with required columns (Category, Offer-Sub Offer, Deal Stage)
- **LocalStorage Persistence**: Data survives page reloads until a new file is uploaded
- **Automatic Compression**: Uses lz-string for efficient storage

### 📈 Strength Calculation
The app calculates a configurable **Strength Index** based on:
- **Sign Rate** = (Signed + Won) ÷ Total deals
- **Delivery Rate** = Won ÷ (Signed + Won)
- **Strength Index** = 100 × (w_sign × Sign Rate + w_deliver × Delivery Rate)

Default weights are 0.5 each, configurable in `lib/strength-calculator.ts`.

### 🎯 Visualizations

1. **Category Radar Chart**: Overall IDEO strengths across all categories
2. **Category Rankings**: Sortable list with metrics (deals, sign%, deliver%, strength index)
3. **Offer Drill-down**: Click any category to see offer-level breakdown
4. **Offer Rankings**: Detailed metrics for each offer within selected category
5. **Category × Offer Heatmap**: Complete matrix view of all combinations
6. **AI-Powered Analysis**: AI-generated executive summary and SWOT analysis of IDEO's performance

## Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Nivo (@nivo/radar, @nivo/heatmap)
- **CSV Parsing**: PapaParse
- **Data Storage**: LocalStorage with lz-string compression
- **AI Integration**: OpenAI for intelligent analysis

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   
   Create a `.env.local` file in the root directory:
   ```bash
   OPENAI_API_KEY=your-openai-api-key-here
   ```
   
   Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Usage

The app automatically loads sample data on first visit, so you can start exploring immediately!

1. **Explore Pre-loaded Data**: Sample data is automatically loaded on first visit
2. **View Categories**: See overall category strengths in radar chart and ranked list
3. **Drill Down**: Click any category to explore offers within it
4. **Analyse Patterns**: Use the heatmap to identify strengths across all combinations
5. **AI Analysis**: Navigate to the 4th slide for AI-powered insights and SWOT analysis
6. **Upload Your Own CSV**: Click "Upload CSV" in the navbar to replace with your own dataset

### CSV Format

Your CSV must include these columns:
- `Category` - Sector or category name
- `Offer-Sub Offer` - Specific offer/service name  
- `Deal Stage` - Current stage of the deal

Deal stages are mapped as:
- **Won/Closed Won** → Delivered
- **Qualified/Prospecting** → Signed but not yet won
- **Cancelled/Lost** → Not successful

### Sample CSV

```csv
Category,Offer-Sub Offer,Deal Stage
Design,UX Research,Won
Design,UI Design,Qualified
Strategy,Business Strategy,Prospecting
Technology,AI Development,Closed Won
Design,UX Research,Lost
```

## Project Structure

```
mosaic/
├── app/
│   ├── clients/          # Clients page (placeholder)
│   ├── strengths/        # Main strengths visualization page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── category-radar.tsx
│   ├── offer-radar.tsx
│   ├── ranked-list.tsx
│   ├── strength-heatmap.tsx
│   ├── ai-analysis.tsx   # AI analysis component
│   ├── csv-upload.tsx
│   └── navbar.tsx
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── strength-calculator.ts  # Core calculation logic
│   ├── storage.ts        # LocalStorage utilities
│   └── utils.ts          # General utilities
└── README.md
```

## Configuration

### AI Analysis Settings

The AI analysis uses the following configuration:
- **Model**: `gpt-5-mini`
- **Reasoning Effort**: `medium` (balances speed and quality)
- **Text Verbosity**: `medium` (balanced output length)

To modify these settings, edit `/app/api/analyze/route.ts`:

```typescript
const response = await openai.responses.create({
  model: 'gpt-5-mini',
  reasoning: { effort: 'medium' },  // Options: minimal, low, medium, high
  text: { verbosity: 'medium' },    // Options: low, medium, high
});
```

### Adjusting Strength Weights

Edit `lib/strength-calculator.ts`:

```typescript
export const STRENGTH_WEIGHTS = {
  signRate: 0.5,      // Weight for sign rate (0-1)
  deliveryRate: 0.5,  // Weight for delivery rate (0-1)
};
```

### Customizing Deal Stage Mappings

Modify the `mapDealStage()` function in `lib/strength-calculator.ts` to match your organization's stage names.

## Development

### Adding New Components

shadcn/ui components can be added with:

```bash
npx shadcn@latest add [component-name]
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Deployment on Vercel

### Prerequisites
1. A [Vercel account](https://vercel.com)
2. An OpenAI API key

### Steps to Deploy

1. **Connect your GitHub repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In your Vercel project settings, go to "Environment Variables"
   - Add the following variable:
     - `OPENAI_API_KEY`: Your OpenAI API key

3. **Deploy**
   - Vercel will automatically detect Next.js and deploy
   - Your app will be live at `https://your-project.vercel.app`

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `OPENAI_API_KEY` - OpenAI API key for AI analysis features

## License

Private - IDEO Internal Use

## Support

For questions or issues, contact the development team.
