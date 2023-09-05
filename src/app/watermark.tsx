import Image from 'next/image';

const imageStyle = {
	display: 'inline'
}

export default function Watermark(){
	return(
		<div className='place-self-center h-7 ml-1 px-2 fixed drop-shadow-xl rounded-t-md absolute bottom-0 left-0 position-bottom bg-gradient-to-r from-cyan-500 to-blue-500'>
			Made with <Image
			src="https://icons.iconarchive.com/icons/arturo-wibawa/akar/256/typescript-icon.png"
			alt="Typescript logo"
			width={16}
			height={16}
			style={imageStyle}
			/> <Image
			src="https://icons.iconarchive.com/icons/pictogrammers/material/256/react-icon.png"
			alt="React logo"
			width={16}
			height={16}
			style={imageStyle}
			/> <Image
			src="https://icons.iconarchive.com/icons/arturo-wibawa/akar/256/nextjs-icon.png"
			alt="Next JS logo"
			width={16}
			height={16}
			style={imageStyle} 
			/> <Image
			src="https://icons.iconarchive.com/icons/pictogrammers/material/256/tailwind-icon.png"
			alt="Tailwind CSS logo"
			width={16}
			height={16}
			style={imageStyle}/>
		</div>
	)
}