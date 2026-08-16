import type { ImageLoaderProps } from "next/image";

export default function cloudinaryLoader({ src, width }: ImageLoaderProps) {
  const transformation = `f_auto,c_limit,w_${width},q_auto:best`;
  return src.replace("/upload/", `/upload/${transformation}/`);
}
