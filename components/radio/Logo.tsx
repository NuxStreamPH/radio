import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/images/nxsr-logo.svg"
      height={44}
      width={44}
      unoptimized={true}
      alt=""
      draggable="false"
      loading="eager"
      className="select-none [-webkit-user-drag:none] [user-drag:none]"
    />
  );
}
