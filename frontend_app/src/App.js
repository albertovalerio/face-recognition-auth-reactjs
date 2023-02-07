import React from 'react'
import './css/App.css'
import { Route, Routes } from "react-router-dom"
import { Auth } from './components/Auth'
import { AuthContainer } from './containers/AuthContainer'
import { PrivateContainer } from './containers/PrivateContainer'
import { Loader } from './components/Loader'
import { Dashboard } from './components/backoffice/Dashboard'

const App = () => {

	return (
		<div className="limiter">
			<Loader />
			<div className="container-login100" style={{backgroundImage: "url(/images/bg.jpg)"}}>    
				<Routes>
					<Route path='/' element={<AuthContainer><Auth /></AuthContainer>} />
					<Route path='/dashboard' element={<PrivateContainer><Dashboard /></PrivateContainer>} />
				</Routes>
			</div>
		</div>
	);
}

export default App;
