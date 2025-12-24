import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TradeForm } from './components/TradeForm';
import { TradeList } from './components/TradeList';
import { TradeDetail } from './components/TradeDetail';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<TradeForm />} />
            <Route path="/trades" element={<TradeList />} />
            <Route path="/trades/:id" element={<TradeDetail />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
