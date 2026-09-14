import { Link, Outlet } from 'react-router-dom'

export function SiteLayout() {
  return (
    <div className="site">
      <header className="site-header">
        <div className="container site-header-inner">
          <Link to="/wardogs" className="site-brand">
            WarDogs 工具
          </Link>
          <nav aria-label="站点导航">
            <Link to="/wardogs">工具列表</Link>
          </nav>
        </div>
      </header>
      <main className="site-main container">
        <Outlet />
      </main>
      <footer className="site-footer container">
        <p>本站为玩家自制工具，与游戏官方无关。部分游戏参数尚未核实，请以各工具内说明为准。</p>
      </footer>
    </div>
  )
}
