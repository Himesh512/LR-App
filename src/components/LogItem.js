import React from 'react'

const LogItem = ({ log : _id, priority, user, text, created }) => {
  return (
    <tr>
        <td>{ priority }</td>
        <td>{ user }</td>
        <td>{ text }</td>
        <td>{ created }</td>
        <td>{ priority }</td>
    </tr>
  )
}

export default LogItem