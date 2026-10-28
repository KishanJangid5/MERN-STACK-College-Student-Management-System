import { Icons } from './Icons';

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card skeleton-card">
            <div className="skeleton-line w-40"></div>
            <div className="skeleton-line w-60 h-8"></div>
          </div>
        ))}
      </div>
    );
  }

  const {
    totalStudents = 0,
    totalCourses = 0,
    activeStudents = 0,
    averageGpa = 0
  } = stats || {};

  const cards = [
    {
      title: 'Total Students',
      value: totalStudents,
      sub: `${activeStudents} currently active`,
      icon: <Icons.Users className="stat-icon-svg" />,
      color: 'red'
    },
    {
      title: 'Registered Courses',
      value: totalCourses,
      sub: 'Across all departments',
      icon: <Icons.BookOpen className="stat-icon-svg" />,
      color: 'rose'
    },
    {
      title: 'Active Enrolled',
      value: activeStudents,
      sub: totalStudents > 0 ? `${Math.round((activeStudents / totalStudents) * 100)}% retention rate` : '100% rate',
      icon: <Icons.GraduationCap className="stat-icon-svg" />,
      color: 'emerald'
    },
    {
      title: 'Average CGPA',
      value: averageGpa ? `${averageGpa} / 10` : 'N/A',
      sub: averageGpa >= 8.5 ? 'Excellent Standing' : averageGpa >= 7.0 ? 'Good Standing' : 'Average',
      icon: <Icons.Award className="stat-icon-svg" />,
      color: 'amber'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, idx) => (
        <div key={idx} className={`stat-card stat-${card.color}`}>
          <div className="stat-header">
            <span className="stat-title">{card.title}</span>
            <div className={`stat-icon-wrapper bg-${card.color}`}>
              {card.icon}
            </div>
          </div>
          <div className="stat-body">
            <span className="stat-value">{card.value}</span>
            <span className="stat-sub">{card.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
