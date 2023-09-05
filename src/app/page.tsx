import Links from './links'
import Personal from './personal'

export default function Home() {
	return (
			<div id="main-container" className="flex flex-col frame m-2 sm:flex-row">
				<div id="links-container" className="flex flex-col">
				<p className="text-yellow-500">/ USEFUL CONTENT</p>
					{Links()}
				</div>
				<div id="personal-container" className="sm:ml-1.5">
					<p className="text-white-100">/ MY SUTFF</p>
					{Personal()}
				</div>
			</div>
	)
}
