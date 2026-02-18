import { useSelector } from "react-redux";
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./components/Home/Home";
import Landing from "./components/Landing/Landing";
import Auth from "./components/Auth/Auth";
import Signup from "./components/Auth/Signup";
import PostDetails from "./components/PostDetails/PostDetails";
import Dashboard from "./components/Dashboard/Dashboard";
import Recommendations from "./components/Recommendations/Recommendations";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import About from "./components/About/About";
import Contact from "./components/Contact/Contact";
import Privacy from "./components/Privacy/Privacy";
import NotFound from "./components/NotFound/NotFound";

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
						{/* Root: Landing for guests, feed for logged-in users */}
						<Route
							path="/"
							exact
							component={() =>
								user ? <Redirect to="/posts" /> : <Landing />
							}
						/>

						{/* Main posts feed */}
						<Route path="/posts" exact component={Home} />
						<Route path="/posts/search" exact component={Home} />
						<Route path="/posts/:id" component={PostDetails} />

						{/* Explore goes to the same feed */}
						<Route
							path="/explore"
							component={() => <Redirect to="/posts" />}
						/>


						{/* Personalized recommendations (auth required) */}
						<Route
							path="/recommendations"
							component={() =>
								user ? (
									<Recommendations />
								) : (
									<Redirect to="/auth" />
								)
							}
						/>

						{/* Admin dashboard (admin only) */}
						<Route
							path="/dashboard"
							component={() =>
								user?.result?.isAdmin ? (
									<Dashboard />
								) : (
									<Redirect to="/posts" />
								)
							}
						/>

						{/* Static / info pages */}
						<Route path="/how-it-works" component={HowItWorks} />
						<Route path="/about" component={About} />
						<Route path="/contact" component={Contact} />
						<Route path="/privacy" component={Privacy} />

						{/* Auth pages */}
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

						{/* 404 fallback */}
						<Route component={NotFound} />
					</Switch>
				</div>
			</div>
		</BrowserRouter>
	);
};

export default App;
