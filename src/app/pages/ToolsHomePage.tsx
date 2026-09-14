import { Link } from 'react-router-dom'
import { tools } from '../../tools'

export function ToolsHomePage() {
  return (
    <>
      <h1>WarDogs 工具</h1>
      <p className="lead">面向 WarDogs（战狗）玩家的实用工具集。</p>
      <ul className="tool-list">
        {tools.map((tool) => (
          <li key={tool.path}>
            <Link to={tool.path} className="tool-card">
              <h2>{tool.name}</h2>
              <p>{tool.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
