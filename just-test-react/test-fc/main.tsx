import ReactDOM from 'react-dom/client';
import { useState } from 'react';

function App() {
	const [v, setV] = useState(true);
	return (
		<div>
			{v ? <h1>This is a h1</h1> : <h3>This is a h3</h3>}
			<button onClick={() => setV(!v)}>button</button>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
