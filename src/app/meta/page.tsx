"use client";

import dynamic from 'next/dynamic';

const ImageLibrary = dynamic(() => import('@/components/meta/ImageLibrary'), {
  ssr: false
});

export default function MetaPage() {
  return <ImageLibrary />;
}