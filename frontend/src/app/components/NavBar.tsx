import Link from "next/link"
import styles from "../styles/Nav.module.css"

export default function NavBar() {
	return (
		<div className={styles.header}>
			<h1 className={styles.title}>FailSafe Vault</h1>
			<div className={styles.navLinks}>
				<Link href="/">Deposit</Link>
				<Link href="/withdraw">Withdraw</Link>
			</div>
			<div className={styles.buttonContainer}>
				<w3m-button />
			</div>
		</div>
	)
}