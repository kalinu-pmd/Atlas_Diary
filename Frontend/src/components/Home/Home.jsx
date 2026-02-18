import Hero from "../Hero/Hero";
import Footer from "../Footer/Footer";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen bg-off-white">
			<Hero />
			<Footer />
		</div>
	);
}
