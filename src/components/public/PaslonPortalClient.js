'use client';

import PaslonSlider from '@/components/public/PaslonSlider';
import TranslatingNotice from '@/components/public/TranslatingNotice';
import { useTranslatedData } from '@/hooks/useTranslatedData';
import { getPublikPaslonList } from '@/api/publlic/paslon';

export default function PaslonPortalClient() {
  const { data, loading, translating } = useTranslatedData('paslon', getPublikPaslonList);

  if (loading) {
    return translating ? (
      <TranslatingNotice show fullHeight />
    ) : (
      <div className="h-72 rounded-3xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 animate-pulse" />
    );
  }

  return <PaslonSlider paslonList={data} />;
}
