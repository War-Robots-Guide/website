import { ROUTES_BY_ID } from '../../config/routes';

const EASTER_EGG_BACKGROUND = '/backgrounds/easteregg-crimsonhawk-bg.webp';

export function RouteBackgrounds({ activeTab, isEasterEggActive }) {
  const background = isEasterEggActive
    ? EASTER_EGG_BACKGROUND
    : ROUTES_BY_ID[activeTab]?.background;

  return (
    <div className="bg-layers" aria-hidden="true" data-testid="route-backgrounds">
      <div
        key={activeTab}
        className={`bg-layer bg-theme-${activeTab} active`}
        data-background-tab={activeTab}
        style={{
          '--bg-active-opacity': isEasterEggActive ? 0.75 : 0.15,
          backgroundImage: `url('${background}')`,
          transform: 'scale(1.02)',
          filter: 'blur(0px)',
        }}
      />
    </div>
  );
}
