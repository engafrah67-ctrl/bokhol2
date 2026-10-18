import { redirect } from 'next/navigation'

export default function SupplierNewPostRedirect() {
  redirect('/dashboard/admin')
}
