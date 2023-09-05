import Image from 'next/image';
import pythonIcon from "../../public/python-logo.svg"

const imageStyle = {
	display: 'inline'
}

export default function Personal(){
	return(
		<div id="personal-links-container" className="frame max-w-sm">
		I sometimes work on this linux script that tries to patch up 
		defaults and stuff made with <Image
		src={pythonIcon}
		width={16}
		alt="python logo"
		style={imageStyle}
		/> <p className='text-blue-500 inline'>Pyt</p><p className='text-yellow-500 inline'>hon</p>
		<p className='italic'>and some bash.</p>
		
		<br/>
		<a href="https://github.com/PetricaT/MLS"><Image
		src={'https://icons.iconarchive.com/icons/martz90/circle/256/linux-icon.png'}
		width={16}
		height={16}
		alt="linux logo"
		style={imageStyle}
		/> My Linux Script</a>
		</div>
	)
}