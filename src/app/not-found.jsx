import Link from "next/link"

const NotFound = () => {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Перепрошуємо, сторінка, яку ви шукаєте не існує.</p>
      <Link href="/">Повернутися на головну</Link>
    </div>
  )
}

export default NotFound