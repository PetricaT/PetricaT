export default function Links() {
	return(
<div id="link-container" className="frame">
<table className="ml-1">
	<tr id="table-header" className="font-bold">
		<td className="flex mr-3 border-b border-indigo-400">Name</td>
		<td className="border-b border-indigo-400">Category</td>
	</tr>

	<tr>
		<td className="flex flex-row mr-3">
			<img src="https://i.imgur.com/jAezl6H.png" alt='' className="object-none h-7 place-self-center mr-1"></img>
			<a href="http://www.michieldb.nl/other/cursors/">Posy&apos;s Cursors</a>
		</td>
		<td>Windows</td>
	</tr>

	<tr>
		<td className="flex flex-row mr-3">
			<img src="https://avatars.githubusercontent.com/u/60579014?s=48&v=4" alt='' className="object-none h-7 place-self-center mr-1"></img>
			<a href="https://github.com/passivestar/quickmenu">Quick Menu</a>
		</td>
		<td>Blender</td>
	</tr>

	<tr>
		<td className="flex flex-row mr-3">
			<img src="https://avatars.githubusercontent.com/u/42185237?v=4" alt='' className="object-none h-7 place-self-center mr-1"></img>
			<a href="https://github.com/Dangry98/Key-Ops-Toolkit">Key Ops Toolkit</a>
		</td>
		<td>Blender</td>
	</tr>

</table>
</div>
	)
}