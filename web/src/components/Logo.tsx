import './Logo.css';

export default function Logo() {
  return (
    <div className="logo-wrap" aria-hidden="true">
      <img
        src="/logo.webp"
        alt=""
        className="logo-img"
        draggable={false}
      />
    </div>
  );
}
