# coding: utf-8
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.dialects.postgresql.base import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()
metadata = Base.metadata


class BibDroit(Base):
    __tablename__ = 'bib_droits'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_droit = Column(Integer, primary_key=True)
    nom_droit = Column(String(50))
    desc_droit = Column(Text)


class BibOrganisme(Base):
    __tablename__ = 'bib_organismes'
    __table_args__ = {u'schema': 'utilisateurs'}

    uuid_organisme = Column(UUID, nullable=False, server_default=FetchedValue())
    nom_organisme = Column(String(100), nullable=False)
    adresse_organisme = Column(String(128))
    cp_organisme = Column(String(5))
    ville_organisme = Column(String(100))
    tel_organisme = Column(String(14))
    fax_organisme = Column(String(14))
    email_organisme = Column(String(100))
    id_organisme = Column(Integer, primary_key=True, server_default=FetchedValue())
    id_parent = Column(ForeignKey(u'utilisateurs.bib_organismes.id_organisme', onupdate=u'CASCADE'))

    parent = relationship(u'BibOrganisme', remote_side=[id_organisme], primaryjoin='BibOrganisme.id_parent == BibOrganisme.id_organisme', backref=u'bib_organismes')
    t_tags = relationship(u'TTag', secondary=u'utilisateurs.cor_organism_tag', backref=u'bib_organismes')


class BibTagType(Base):
    __tablename__ = 'bib_tag_types'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag_type = Column(Integer, primary_key=True)
    tag_type_name = Column(String(100), nullable=False)
    tag_type_desc = Column(String(255), nullable=False)


class BibUnite(Base):
    __tablename__ = 'bib_unites'
    __table_args__ = {u'schema': 'utilisateurs'}

    nom_unite = Column(String(50), nullable=False)
    adresse_unite = Column(String(128))
    cp_unite = Column(String(5))
    ville_unite = Column(String(100))
    tel_unite = Column(String(14))
    fax_unite = Column(String(14))
    email_unite = Column(String(100))
    id_unite = Column(Integer, primary_key=True, server_default=FetchedValue())


class CorAppPrivilege(Base):
    __tablename__ = 'cor_app_privileges'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag_action = Column(ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_tag_object = Column(ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_application = Column(ForeignKey(u'utilisateurs.t_applications.id_application', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_role = Column(ForeignKey(u'utilisateurs.t_roles.id_role', onupdate=u'CASCADE'), primary_key=True, nullable=False)

    t_application = relationship(u'TApplication', primaryjoin='CorAppPrivilege.id_application == TApplication.id_application', backref=u'cor_app_privileges')
    t_role = relationship(u'TRole', primaryjoin='CorAppPrivilege.id_role == TRole.id_role', backref=u'cor_app_privileges')
    t_tag = relationship(u'TTag', primaryjoin='CorAppPrivilege.id_tag_action == TTag.id_tag', backref=u'ttag_cor_app_privileges')
    t_tag1 = relationship(u'TTag', primaryjoin='CorAppPrivilege.id_tag_object == TTag.id_tag', backref=u'ttag_cor_app_privileges_0')


t_cor_application_tag = Table(
    'cor_application_tag', metadata,
    Column('id_application', ForeignKey(u'utilisateurs.t_applications.id_application', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    Column('id_tag', ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


t_cor_organism_tag = Table(
    'cor_organism_tag', metadata,
    Column('id_organism', ForeignKey(u'utilisateurs.bib_organismes.id_organisme', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    Column('id_tag', ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


class CorRoleDroitApplication(Base):
    __tablename__ = 'cor_role_droit_application'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_role = Column(ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_droit = Column(ForeignKey(u'utilisateurs.bib_droits.id_droit', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_application = Column(ForeignKey(u'utilisateurs.t_applications.id_application', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False)

    t_application = relationship(u'TApplication', primaryjoin='CorRoleDroitApplication.id_application == TApplication.id_application', backref=u'cor_role_droit_applications')
    bib_droit = relationship(u'BibDroit', primaryjoin='CorRoleDroitApplication.id_droit == BibDroit.id_droit', backref=u'cor_role_droit_applications')
    t_role = relationship(u'TRole', primaryjoin='CorRoleDroitApplication.id_role == TRole.id_role', backref=u'cor_role_droit_applications')


t_cor_role_menu = Table(
    'cor_role_menu', metadata,
    Column('id_role', ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    Column('id_menu', ForeignKey(u'utilisateurs.t_menus.id_menu', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


t_cor_role_tag = Table(
    'cor_role_tag', metadata,
    Column('id_role', ForeignKey(u'utilisateurs.t_roles.id_role', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    Column('id_tag', ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


t_cor_roles = Table(
    'cor_roles', metadata,
    Column('id_role_groupe', ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    Column('id_role_utilisateur', ForeignKey(u'utilisateurs.t_roles.id_role', ondelete=u'CASCADE', onupdate=u'CASCADE'), primary_key=True, nullable=False),
    schema='utilisateurs'
)


class CorTagsRelation(Base):
    __tablename__ = 'cor_tags_relations'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag_l = Column(ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    id_tag_r = Column(ForeignKey(u'utilisateurs.t_tags.id_tag', onupdate=u'CASCADE'), primary_key=True, nullable=False)
    relation_type = Column(String(255), nullable=False)

    t_tag = relationship(u'TTag', primaryjoin='CorTagsRelation.id_tag_l == TTag.id_tag', backref=u'ttag_cor_tags_relations')
    t_tag1 = relationship(u'TTag', primaryjoin='CorTagsRelation.id_tag_r == TTag.id_tag', backref=u'ttag_cor_tags_relations_0')


class TApplication(Base):
    __tablename__ = 't_applications'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_application = Column(Integer, primary_key=True, server_default=FetchedValue())
    nom_application = Column(String(50), nullable=False)
    desc_application = Column(Text)
    id_parent = Column(ForeignKey(u'utilisateurs.t_applications.id_application', onupdate=u'CASCADE'))

    parent = relationship(u'TApplication', remote_side=[id_application], primaryjoin='TApplication.id_parent == TApplication.id_application', backref=u't_applications')
    t_tags = relationship(u'TTag', secondary=u'utilisateurs.cor_application_tag', backref=u't_applications')


class TMenu(Base):
    __tablename__ = 't_menus'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_menu = Column(Integer, primary_key=True, server_default=FetchedValue())
    nom_menu = Column(String(50), nullable=False)
    desc_menu = Column(Text)
    id_application = Column(ForeignKey(u'utilisateurs.t_applications.id_application', ondelete=u'CASCADE', onupdate=u'CASCADE'))

    t_application = relationship(u'TApplication', primaryjoin='TMenu.id_application == TApplication.id_application', backref=u't_menus')
    t_roles = relationship(u'TRole', secondary=u'utilisateurs.cor_role_menu', backref=u't_menus')


class TRole(Base):
    __tablename__ = 't_roles'
    __table_args__ = {u'schema': 'utilisateurs'}

    groupe = Column(Boolean, nullable=False, server_default=FetchedValue())
    id_role = Column(Integer, primary_key=True, server_default=FetchedValue())
    uuid_role = Column(UUID, nullable=False, server_default=FetchedValue())
    identifiant = Column(String(100))
    nom_role = Column(String(50))
    prenom_role = Column(String(50))
    desc_role = Column(Text)
    _pass = Column('pass', String(100))
    pass_plus = Column(Text)
    email = Column(String(250))
    id_organisme = Column(ForeignKey(u'utilisateurs.bib_organismes.id_organisme', onupdate=u'CASCADE'))
    organisme = Column(String(32))
    id_unite = Column(ForeignKey(u'utilisateurs.bib_unites.id_unite', onupdate=u'CASCADE'))
    remarques = Column(Text)
    pn = Column(Boolean)
    session_appli = Column(String(50))
    date_insert = Column(DateTime)
    date_update = Column(DateTime)

    bib_organisme = relationship(u'BibOrganisme', primaryjoin='TRole.id_organisme == BibOrganisme.id_organisme', backref=u't_roles')
    bib_unite = relationship(u'BibUnite', primaryjoin='TRole.id_unite == BibUnite.id_unite', backref=u't_roles')
    parents = relationship(
        u'TRole',
        secondary=u'utilisateurs.cor_roles',
        primaryjoin=u'TRole.id_role == cor_roles.c.id_role_groupe',
        secondaryjoin=u'TRole.id_role == cor_roles.c.id_role_utilisateur',
        backref=u't_roles'
    )
    t_tags = relationship(u'TTag', secondary=u'utilisateurs.cor_role_tag', backref=u't_roles')


class TTag(Base):
    __tablename__ = 't_tags'
    __table_args__ = {u'schema': 'utilisateurs'}

    id_tag = Column(Integer, primary_key=True, server_default=FetchedValue())
    id_tag_type = Column(ForeignKey(u'utilisateurs.bib_tag_types.id_tag_type', onupdate=u'CASCADE'), nullable=False)
    tag_code = Column(String(25))
    tag_name = Column(String(255))
    tag_label = Column(String(255))
    tag_desc = Column(Text)
    date_insert = Column(DateTime)
    date_update = Column(DateTime)

    bib_tag_type = relationship(u'BibTagType', primaryjoin='TTag.id_tag_type == BibTagType.id_tag_type', backref=u't_tags')


t_v_usersaction_forall_gn_modules = Table(
    'v_usersaction_forall_gn_modules', metadata,
    Column('id_role', Integer),
    Column('identifiant', String(100)),
    Column('nom_role', String(50)),
    Column('prenom_role', String(50)),
    Column('desc_role', Text),
    Column('pass', String(100)),
    Column('pass_plus', Text),
    Column('email', String(250)),
    Column('id_organisme', Integer),
    Column('id_application', Integer),
    Column('id_tag_action', Integer),
    Column('id_tag_object', Integer),
    Column('tag_action_code', String(25)),
    Column('tag_object_code', String(25)),
    schema='utilisateurs'
)


t_v_userslist_forall_applications = Table(
    'v_userslist_forall_applications', metadata,
    Column('groupe', Boolean),
    Column('id_role', Integer),
    Column('identifiant', String(100)),
    Column('nom_role', String(50)),
    Column('prenom_role', String(50)),
    Column('desc_role', Text),
    Column('pass', String(100)),
    Column('pass_plus', Text),
    Column('email', String(250)),
    Column('id_organisme', Integer),
    Column('organisme', String(32)),
    Column('id_unite', Integer),
    Column('remarques', Text),
    Column('pn', Boolean),
    Column('session_appli', String(50)),
    Column('date_insert', DateTime),
    Column('date_update', DateTime),
    Column('id_droit_max', Integer),
    Column('id_application', Integer),
    schema='utilisateurs'
)


t_v_userslist_forall_menu = Table(
    'v_userslist_forall_menu', metadata,
    Column('groupe', Boolean),
    Column('id_role', Integer),
    Column('uuid_role', UUID),
    Column('identifiant', String(100)),
    Column('nom_role', String(50)),
    Column('prenom_role', String(50)),
    Column('nom_complet', Text),
    Column('desc_role', Text),
    Column('pass', String(100)),
    Column('pass_plus', Text),
    Column('email', String(250)),
    Column('id_organisme', Integer),
    Column('organisme', String(32)),
    Column('id_unite', Integer),
    Column('remarques', Text),
    Column('pn', Boolean),
    Column('session_appli', String(50)),
    Column('date_insert', DateTime),
    Column('date_update', DateTime),
    Column('id_menu', Integer),
    schema='utilisateurs'
)
