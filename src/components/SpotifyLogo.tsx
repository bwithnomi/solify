import Image from "next/image";
const imageStyle = {
    fill: "red",
}
export function SidebarLogo () {
    return <Image src={`/solify-ls.png`} width="78" height="24" style={imageStyle} alt="logo"/>
}