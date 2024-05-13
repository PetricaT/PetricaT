import Links from './links'
import Personal from './personal'
import Calendar from './calendar'

export default function Home() {
	return (
			<div id="main-container" className="flex flex-col frame m-2 sm:flex-row">
				<div id="links-container" className="flex flex-col">
				<p className="text-yellow-500">&#47;&#47; USEFUL CONTENT</p>
					{Links()}
				</div>
				<div id="personal-container" className="sm:ml-1.5">
					<p className="text-white-100">&#47;&#47; MY SUTFF</p>
					{Personal()}
				</div>
				<div id="calendar-container" className="sm:ml-1.5">
					<p className="text-white-100">&#47;&#47; CALENDAR</p>
					{Calendar()}
				</div>
			</div>
	)
}
