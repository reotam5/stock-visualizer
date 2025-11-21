import { Layout } from './components/Layout';
import { PortfolioInput } from './components/PortfolioInput';
import { PortfolioHeatmap } from './components/PortfolioHeatmap';
import { GrowthSimulator } from './components/GrowthSimulator';

function App() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input */}
        <div className="lg:col-span-4 space-y-6">
          <PortfolioInput />
        </div>

        {/* Right Column: Visualizations */}
        <div className="lg:col-span-8 space-y-6">
          <PortfolioHeatmap />
          <GrowthSimulator />
        </div>
      </div>
    </Layout>
  );
}

export default App;
