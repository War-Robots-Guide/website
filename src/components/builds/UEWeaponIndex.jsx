import { useEffect, useId, useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { getWeaponImage } from '../../utils/imageUtils';
import { getIndexWeaponNames } from '../../utils/ueWeaponIndex';

export function UEWeaponIndex({ index }) {
  const id = useId();
  const [motionPreference] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)'));
  const [playing, setPlaying] = useState(() => !motionPreference?.matches);
  const [frame, setFrame] = useState(0);
  const [failedImages, setFailedImages] = useState([]);
  const categories = useMemo(() => Object.entries(index).map(([category, weapons]) => ({
    category, weapons,
    previews: getIndexWeaponNames(category, index).map(name => ({ name, image: getWeaponImage(name) }))
      .filter(preview => preview.image),
  })), [index]);
  const available = categories.map(category => ({
    ...category, previews: category.previews.filter(preview => !failedImages.includes(preview.image)),
  }));
  const canCycle = available.some(category => category.previews.length > 1);

  useEffect(() => {
    const handleMotionChange = () => { if (motionPreference.matches) setPlaying(false); };
    motionPreference?.addEventListener('change', handleMotionChange);
    return () => motionPreference?.removeEventListener('change', handleMotionChange);
  }, [motionPreference]);

  useEffect(() => {
    if (!playing || !canCycle) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFrame(previous => previous + 1);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [playing, canCycle]);

  return <section className="ue-weapon-index" aria-label="Ultimate weapon categories">
    <div className="ue-index-toolbar">
      <p>When build guides specify <em>&quot;UE Setups&quot;</em>, <em>&quot;Midrange UE setups&quot;</em>, or <em>&quot;Close range UE setups&quot;</em>, refer to these weapon categories:</p>
      {canCycle && <button type="button" className="ue-preview-toggle"
        onClick={() => setPlaying(previous => !previous)}
        aria-label={`${playing ? 'Pause' : 'Play'} weapon previews`}>
        {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
        {playing ? 'Pause' : 'Play'}
      </button>}
    </div>
    <div className="ue-index-grid">
      {available.map(({ category, weapons, previews }, position) => {
        const preview = previews[frame % previews.length];
        return <article className="ue-weapon-category" key={category} aria-labelledby={`${id}-${position}`}>
          <h3 id={`${id}-${position}`}>{category} Setups</h3>
          <figure className="ue-weapon-preview">
            {preview ? <img key={preview.image} src={preview.image} alt={preview.name} decoding="async"
              onError={() => setFailedImages(previous => [...previous, preview.image])} />
              : <img src="/icons/weapon_gold.png" alt="" />}
            <figcaption>{preview?.name || 'Weapon options below'}</figcaption>
          </figure>
          <p className="ue-weapon-list">{weapons}</p>
        </article>;
      })}
    </div>
  </section>;
}
