import {Switch} from 'antd';
import React, {useState} from 'react';
import './App.css';
import {DPLLComponent} from './DPLL';
import {ResolutionComponent} from "./Resolution";

class ErrorBoundary extends React.Component {
    constructor(props : any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error : any) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error : any, errorInfo: any) {

    }

    render() {
        if ((this.state as any).hasError) {
            return <h1>I mean you did not seriously expect me to make this bug free did you, F5, and pray it doesn't crash</h1>;
        }

        return this.props.children;
    }
}


function App() {
    let [formula, setFormula] = useState<string>();
    let [show, setShow] = useState<boolean>(false);
    let [useResolution, setUseResoltion] = useState<boolean>(true);

    return (
        <div>
            <ErrorBoundary>
            <input
                value={formula}
                onChange={(evt) => {
                    setFormula(evt.target.value);
                }}/>
            <Switch onClick={() => {
                setUseResoltion(!useResolution)
            }} checked={useResolution} unCheckedChildren={<>DPML</>} checkedChildren={<>Resolution</>}/>
            <button onClick={() => {
                setShow(true)
            }}>Go
            </button>
            {show && !useResolution && <DPLLComponent formula={formula as string}/>}
            {show && useResolution && <ResolutionComponent formula={formula as string}/>}
            </ErrorBoundary>
        </div>
    );
}

export default App;
