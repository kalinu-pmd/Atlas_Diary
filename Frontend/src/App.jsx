import { useSelector } from "react-redux";
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Auth from "./components/Auth/Auth";
import Signup from "./components/Auth/Signup";
import PostDetails from "./components/PostDetails/PostDetails";
import Dashboard from "./components/Dashboard/Dashboard";
import Recommendations from "./components/Recommendations/Recommendations";

const App = () => {
	const user = useSelector((state) => state.auth.authData);
	return (
		<BrowserRouter>
			<div className="min-h-screen bg-off-white">
				<Navbar />
				{/* Spacer to offset sticky navbar (~64px) */}
				<div className="h-16" />
				<div className="px-0">
					<Switch>
						<Route
							path="/"
							exact
							component={() => <Redirect to="/posts" />}
						/>
						<Route path="/posts" exact component={Home} />
						<Route path="/posts/search" exact component={Home} />
						<Route path="/posts/:id" component={PostDetails} />
						<Route
							path="/recommendations"
							component={Recommendations}
						/>
						<Route path="/dashboard" component={Dashboard} />
						<Route
							path="/auth"
							exact
							component={() =>
								!user ? <Auth /> : <Redirect to="/posts" />
							}
						/>
						<Route
							path="/signup"
							exact
							component={() =>
								!user ? <Signup /> : <Redirect to="/posts" />
							}
						/>
					</Switch>
				</div>
			</div>
		</BrowserRouter>
	);
};

export default App;
