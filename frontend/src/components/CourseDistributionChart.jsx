export default function CourseDistributionChart({ distribution = [], totalStudents = 0 }) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="card-empty-state">
        <p className="text-muted">No course distribution data available yet.</p>
      </div>
    );
  }

  // Find max count for relative bar scaling
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  const colors = [
    '#e11d48', // crimson red
    '#f43f5e', // rose red
    '#dc2626', // scarlet red
    '#fb7185', // coral rose
    '#ea580c', // burnt orange
    '#f59e0b', // amber
    '#be123c'  // deep ruby
  ];

  return (
    <div className="course-chart-list">
      {distribution.map((item, index) => {
        const percentage = totalStudents > 0 ? Math.round((item.count / totalStudents) * 100) : 0;
        const barWidth = Math.max(Math.round((item.count / maxCount) * 100), 5);
        const color = colors[index % colors.length];

        return (
          <div key={item.course || index} className="course-chart-item">
            <div className="course-chart-label">
              <span className="course-name">{item.course}</span>
              <div className="course-meta">
                <span className="course-count">{item.count} student{item.count > 1 ? 's' : ''}</span>
                <span className="course-percent">({percentage}%)</span>
                {item.avgGpa && (
                  <span className="course-avg-gpa">Avg GPA: {item.avgGpa}</span>
                )}
              </div>
            </div>
            <div className="course-chart-track">
              <div
                className="course-chart-fill"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: color
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
