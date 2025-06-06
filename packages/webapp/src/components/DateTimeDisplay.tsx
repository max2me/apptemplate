import { useApi } from '../hooks/useApi';
import './DateTimeDisplay.css';

export const DateTimeDisplay = () => {
  const { data, loading, error, refetch } = useApi('/datetime');

  if (loading && !data) {
    return (
      <div className="datetime-display">
        <div className="datetime-loading">Loading date/time...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="datetime-display">
        <div className="datetime-error">
          <p>Failed to load date/time: {error}</p>
          <button onClick={refetch} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="datetime-display">
      <div className="datetime-content">
        <h3>API server date &amp; time</h3>
        <div className="datetime-info">
          <div className="datetime-formatted">
            {data.formattedDate}
          </div>
        </div>
      </div>
    </div>
  );
};
