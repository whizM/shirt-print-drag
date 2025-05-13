import TShirtCustomizer from './components/TShirtCustomizer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4">
        <TShirtCustomizer />
      </main>
      <footer className="py-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Custom Print Preview. All rights reserved.
      </footer>
    </div>
  );
}

export default App;