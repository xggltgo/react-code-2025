import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
	const [n, setN] = useState(0);
	const jsx =
		n % 2 === 0
			? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
			: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];
	return (
		<ul onClick={() => setN(n + 1)}>
			{jsx}
		</ul>
	);
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
