import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-site py-20 md:py-28">
      <p className="eyebrow eyebrow-rule">Not found</p>
      <h1 className="text-page mt-5">This page could not be found.</h1>
      <p className="mt-6">
        <Link href="/" className="btn btn-secondary">
          Return home
        </Link>
      </p>
    </section>
  );
}
