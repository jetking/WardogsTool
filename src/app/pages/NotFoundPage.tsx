import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <>
      <h1>页面不存在</h1>
      <p className="lead">你访问的页面不存在或已被移动。</p>
      <p>
        <Link to="/wardogs">返回工具列表</Link>
      </p>
    </>
  )
}
