export default function FAQPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">FAQ</h2>
      <p>Pertanyaan yang sering diajukan mengenai penggunaan sistem.</p>
      <ul className="list-disc space-y-2 pl-4">
        <li>
          <strong>Bagaimana cara mengunduh laporan?</strong> Gunakan tombol
          &quot;Unduh Laporan&quot; pada halaman terkait.
        </li>
        <li>
          <strong>Siapa yang dapat mengakses dashboard?</strong> Pengguna yang
          memiliki hak akses sesuai perannya.
        </li>
      </ul>
    </div>
  )
}
