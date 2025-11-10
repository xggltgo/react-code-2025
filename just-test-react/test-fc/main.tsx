import ReactDOM from 'react-dom/client';
import { useState } from 'react';

function App() {
	const [num, setNum] = useState(0);
	const handleClick = () => {
		setNum(num => num + 1);
		setNum(num => num + 1);
		setNum(num => num + 1);
	};
	return (
		<div>
			<div>{num}</div>
			<button onClickCapture={handleClick}>add</button>
		</div>
	);
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
