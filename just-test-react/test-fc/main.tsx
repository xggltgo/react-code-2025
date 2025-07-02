import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [n, setN] = useState(0);
	window.setN = setN;
	return (
		<div>
			<h1>{n}</h1>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
