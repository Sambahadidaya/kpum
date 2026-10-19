import logoKpu from '@/aseets/logo.png';

export default function DynamicFavicon() {
  return (
    <>
      <link rel="icon" href={logoKpu.src} type="image/png" sizes="any" />
      <link rel="shortcut icon" href={logoKpu.src} type="image/png" />
      <link rel="apple-touch-icon" href={logoKpu.src} />
      <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      <meta name="theme-color" content="#1e40af" media="(prefers-color-scheme: light)" />
    </>
  );
}