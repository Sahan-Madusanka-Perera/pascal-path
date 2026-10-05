import { Link } from 'react-router-dom';
import { Empty } from '../components/ui/primitives';

export default function NotFound() {
  return (
    <div className="page page-narrow">
      <Empty icon="compass" title="This page doesn't exist">
        <p className="muted">The link might be old, or the page has moved.</p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </Empty>
    </div>
  );
}
