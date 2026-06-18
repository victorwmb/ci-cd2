set -e 

mysql -u root -p"${MYSQL_ROOT_PASSWORD}" -D victorwmb_cicd <<-EOSQL
INSERT IGNORE INTO utilisateurs (nom, prenom, email, password, is_admin)
VALUES ('Admin', 'Super', '${ADMIN_EMAIL}', '${ADMIN_PASSWORD}', TRUE);
EOSQL
