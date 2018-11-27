class BibDroit(db.Model):
    __tablename__ = 'bib_droits'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_droit = db.Column(db.Integer, primary_key=True)
    nom_droit = db.Column(db.String(50))
    desc_droit = db.Column(db.Text)


class BibOrganisme(db.Model):
    __tablename__ = 'bib_organismes'
    __table_args__ = {u'schema': 'utilisateurs'}

    uuid_organisme = db.Column(UUID, nullable=False, server_default=db.FetchedValue())
    nom_organisme = db.Column(db.String(100), nullable=False)
    adresse_organisme = db.Column(db.String(128))
    cp_organisme = db.Column(db.String(5))
    ville_organisme = db.Column(db.String(100))
    tel_organisme = db.Column(db.String(14))
    fax_organisme = db.Column(db.String(14))
    email_organisme = db.Column(db.String(100))
    id_organisme = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    id_parent = db.Column(db.ForeignKey(u'utilisateurs.bib_organismes.id_organisme', onupdate=u'CASCADE'))

    parent = db.relationship(u'BibOrganisme', remote_side=[id_organisme], primaryjoin='BibOrganisme.id_parent == BibOrganisme.id_organisme', backref=u'bib_organismes')
    t_tags = db.relationship(u'TTag', secondary=u'utilisateurs.cor_organism_tag', backref=u'bib_organismes')


class BibTagType(db.Model):
    __tablename__ = 'bib_tag_types'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag_type = db.Column(db.Integer, primary_key=True)
    tag_type_name = db.Column(db.String(100), nullable=False)
    tag_type_desc = db.Column(db.String(255), nullable=False)


class BibUnite(db.Model):
    __tablename__ = 'bib_unites'
    __table_args__ = {u'schema': 'utilisateurs'}

    nom_unite = db.Column(db.String(50), nullable=False)
    adresse_unite = db.Column(db.String(128))
    cp_unite = db.Column(db.String(5))
    ville_unite = db.Column(db.String(100))
    tel_unite = db.Column(db.String(14))
    fax_unite = db.Column(db.String(14))
    email_unite = db.Column(db.String(100))
    id_unite = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())


class CorAppPrivilege(db.Model):
    __tablename__ = 'cor_app_privileges'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag_action = db.Column(db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_tag_object = db.Column(db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_application = db.Column(db.ForeignKey(u'utilisateurs.t_applications.id_application', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_role = db.Column(db.ForeignKey(u'utilisateurs.t_roles.id_role', onupdate=u'CASCADE'), primary_key=True, nullable=False)

    t_application = db.relationship(u'TApplication', primaryjoin='CorAppPrivilege.id_application == TApplication.id_application', backref=u'cor_app_privileges')
    t_role = db.relationship(u'TRole', primaryjoin='CorAppPrivilege.id_role == TRole.id_role', backref=u'cor_app_privileges')
    t_tag = db.relationship(u'TTag', primaryjoin='CorAppPrivilege.id_tag_action == TTag.id_tag', backref=u'ttag_cor_app_privileges')
    t_tag1 = db.relationship(u'TTag', primaryjoin='CorAppPrivilege.id_tag_object == TTag.id_tag', backref=u'ttag_cor_app_privileges_0')


t_cor_application_tag = db.Table(
    'cor_application_tag',
    db.Column('id_application', db.ForeignKey(u'utilisateurs.t_applications.id_application', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    db.Column('id_tag', db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


t_cor_organism_tag = db.Table(
    'cor_organism_tag',
    db.Column('id_organism', db.ForeignKey(u'utilisateurs.bib_organismes.id_organisme', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    db.Column('id_tag', db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


class CorRoleDroitApplication(db.Model):
    __tablename__ = 'cor_role_droit_application'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_role = db.Column(db.ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_droit = db.Column(db.ForeignKey(u'utilisateurs.bib_droits.id_droit', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_application = db.Column(db.ForeignKey(u'utilisateurs.t_applications.id_application', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False)

    t_application = db.relationship(u'TApplication', primaryjoin='CorRoleDroitApplication.id_application == TApplication.id_application', backref=u'cor_role_droit_applications')
    bib_droit = db.relationship(u'BibDroit', primaryjoin='CorRoleDroitApplication.id_droit == BibDroit.id_droit', backref=u'cor_role_droit_applications')
    t_role = db.relationship(u'TRole', primaryjoin='CorRoleDroitApplication.id_role == TRole.id_role', backref=u'cor_role_droit_applications')


t_cor_role_menu = db.Table(
    'cor_role_menu',
    db.Column('id_role', db.ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    db.Column('id_menu', db.ForeignKey(u'utilisateurs.t_menus.id_menu', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


t_cor_role_tag = db.Table(
    'cor_role_tag',
    db.Column('id_role', db.ForeignKey(u'utilisateurs.t_roles.id_role', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    db.Column('id_tag', db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


t_cor_roles = db.Table(
    'cor_roles',
    db.Column('id_role_groupe', db.ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    db.Column('id_role_utilisateur', db.ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


class CorTagsRelation(db.Model):
    __tablename__ = 'cor_tags_relations'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag_l = db.Column(db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_tag_r = db.Column(db.ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    relation_type = db.Column(db.String(255), nullable=False)

    t_tag = db.relationship(u'TTag', primaryjoin='CorTagsRelation.id_tag_l == TTag.id_tag', backref=u'ttag_cor_tags_relations')
    t_tag1 = db.relationship(u'TTag', primaryjoin='CorTagsRelation.id_tag_r == TTag.id_tag', backref=u'ttag_cor_tags_relations_0')


class TApplication(db.Model):
    __tablename__ = 't_applications'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_application = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    nom_application = db.Column(db.String(50), nullable=False)
    desc_application = db.Column(db.Text)
    id_parent = db.Column(db.ForeignKey(u'utilisateurs.t_applications.id_application', onupdate=u'CASCADE'))

    parent = db.relationship(u'TApplication', remote_side=[id_application], primaryjoin='TApplication.id_parent == TApplication.id_application', backref=u't_applications')
    t_tags = db.relationship(u'TTag', secondary=u'utilisateurs.cor_application_tag', backref=u't_applications')


class TMenu(db.Model):
    __tablename__ = 't_menus'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_menu = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    nom_menu = db.Column(db.String(50), nullable=False)
    desc_menu = db.Column(db.Text)
    id_application = db.Column(db.ForeignKey(u'utilisateurs.t_applications.id_application', ondelete=u'CASCADE', onupdate=u'CASCADE'))

    t_application = db.relationship(u'TApplication', primaryjoin='TMenu.id_application == TApplication.id_application', backref=u't_menus')
    t_roles = db.relationship(u'TRole', secondary=u'utilisateurs.cor_role_menu', backref=u't_menus')


class TRole(db.Model):
    __tablename__ = 't_roles'
    __table_args__ = {u'schema': 'utilisateurs'}

    groupe = db.Column(db.Boolean, nullable=False, server_default=db.FetchedValue())
    id_role = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    uuid_role = db.Column(UUID, nullable=False, server_default=db.FetchedValue())
    identifiant = db.Column(db.String(100))
    nom_role = db.Column(db.String(50))
    prenom_role = db.Column(db.String(50))
    desc_role = db.Column(db.Text)
    _pass = db.Column('pass', db.String(100))
    pass_plus = db.Column(db.Text)
    email = db.Column(db.String(250))
    id_organisme = db.Column(db.ForeignKey(u'utilisateurs.bib_organismes.id_organisme', onupdate=u'CASCADE'))
    organisme = db.Column(db.String(32))
    id_unite = db.Column(db.ForeignKey(u'utilisateurs.bib_unites.id_unite', onupdate=u'CASCADE'))
    remarques = db.Column(db.Text)
    pn = db.Column(db.Boolean)
    session_appli = db.Column(db.String(50))
    date_insert = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)

    bib_organisme = db.relationship(u'BibOrganisme', primaryjoin='TRole.id_organisme == BibOrganisme.id_organisme', backref=u't_roles')
    bib_unite = db.relationship(u'BibUnite', primaryjoin='TRole.id_unite == BibUnite.id_unite', backref=u't_roles')
    parents = db.relationship(
        u'TRole',
        secondary=u'utilisateurs.cor_roles',
        primaryjoin=u'TRole.id_role == cor_roles.c.id_role_groupe',
        secondaryjoin=u'TRole.id_role == cor_roles.c.id_role_utilisateur',
        backref=u't_roles'
    )
    t_tags = db.relationship(u'TTag', secondary=u'utilisateurs.cor_role_tag', backref=u't_roles')


class TTag(db.Model):
    __tablename__ = 't_tags'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag = db.Column(db.Integer, primary_key=True, server_default=db.FetchedValue())
    id_tag_type = db.Column(db.ForeignKey(u'utilisateurs.bib_tag_types.id_tag_type', onupdate=u'CASCADE'), nullable=False)
    tag_code = db.Column(db.String(25))
    tag_name = db.Column(db.String(255))
    tag_label = db.Column(db.String(255))
    tag_desc = db.Column(db.Text)
    date_insert = db.Column(db.DateTime)
    date_update = db.Column(db.DateTime)

    bib_tag_type = db.relationship(u'BibTagType', primaryjoin='TTag.id_tag_type == BibTagType.id_tag_type', backref=u't_tags')




