import re
import logging

instance_id_regex = re.compile( r"new$" )

class Binder( object ):
  next_select_value = None

  def remove_attrs( self, attr_name, attrs ):
    to_remove = []
    for index, attr in enumerate( attrs ):
      if attr[ 0 ] == attr_name:
        to_remove.append( index )
    for index in to_remove:
      del attrs[ index ]

  def bind_data( self, tag, attrs = None, 
                  next_data = None, close_tag = None, next_select_value = None ):
    if next_select_value:
      self.next_select_value = next_select_value
    return tag, attrs, next_data, close_tag 

  def bind_type( self, tag, attrs ):
    if tag == 'input':
      if ( 'type', 'radio' ) in attrs:
        return 'radio'
      else:
        return tag
    elif (
        ( 
            tag == 'ul' or 
            tag == 'ol' or 
            tag == 'dl' 
          ) and 
        ( 'name', 'models' ) in attrs
      ):
      return 'collection'
    elif ( 
        tag == 'textarea' or
        tag == 'select' or
        tag == 'option' or
        tag == 'form'
      ):
      return tag
    else:
      return None

  def model_can_bind( self, bind_name, model ):
    try:
      return model.hasslot( bind_name )
    except:
      return False

  def try_bind( self, parser, tag, attrs, model ):
    bind_type = self.bind_type( tag, attrs )
    if not bind_type:
      return None
    bind_name = parser.get_attribute_value( 'name', attrs )
    no_bind = parser.has_attribute( 'no-bind', attrs )
    if bind_name:
      model_can_bind = self.model_can_bind( bind_name, model )
    elif tag == 'input':
      raise TypeError( 'Input tag with attrs %s has no name attribute' % ( attrs, ) )
    if ( 
          bind_name and not no_bind and
          model and not model_can_bind
        ):
      logging.warning( model )
      raise TypeError( 'Model can not bind %s' % bind_name )
    else:
      return self.__getattribute__( 'bind_' + bind_type )( parser, tag, attrs, model, bind_name )

  def bind_input( self, parser, tag, attrs, model, bind_name ):
    if model:
      model_value = model.getslot( bind_name )
      self.remove_attrs( 'value', attrs )
      attrs.append( ( 'value', model_value ) )
    return self.bind_data( tag, attrs )

  def bind_select( self, parser, tag, attrs, model, bind_name ):
    model_value = None
    if model:
      model_value = model.getslot( bind_name )
    return self.bind_data( tag, attrs, next_select_value = model_value )

  def bind_option( self, parser, tag, attrs, model, bind_name ):
    option_value = parser.get_attribute_value( 'value', attrs )
    if self.next_select_value and option_value == self.next_select_value:
      attrs.append( ( 'selected', ) )
    return self.bind_data( tag, attrs )

  def bind_textarea( self, parser, tag, attrs, model, bind_name ):
    model_value = None
    if model:
      model_value = model.getslot( bind_name )
    return self.bind_data( tag, attrs, next_data = model_value )

  def bind_radio( self, parser, tag, attrs, model, bind_name ):
    if model:
      radio_value = parser.get_attribute_value( 'value', attrs ) 
      model_value = model.getslot( bind_name )
      if radio_value == model_value:
        attrs.append( ( 'checked', ) )
    return self.bind_data( tag, attrs )

  def bind_form( self, parser, tag, attrs, model, bind_name ):
    if model:
      action_value = parser.get_attribute_value( 'action', attrs ) or ''
      model_key_id = model.getslot( 'key_id' )
      if model_key_id:
        transformed_action_value = instance_id_regex.sub( model_key_id, action_value )
        self.remove_attrs( 'action', attrs )
        attrs.append( ( 'action', transformed_action_value ) )
    return self.bind_data( tag, attrs )

  def bind_collection( self, parser, tag, attrs, model, bind_name ):
    bind_data = []
    bind_data.append( self.bind_data( 'ul', [ ( 'name', 'models' ) ] ) )
    if model:
      models = model.models  
      media_type = model.media_type + '-summary'
      tag = 'iframe'
      src_binder = {
          'key_id' : '',
          'media_type' : media_type
        }
      for instance_key in model.models:
        key_id = unicode( instance_key.id() )
        name_attr = ( 'name', model.media_type + "/" + key_id ) 
        src_binder[ 'key_id' ] = key_id
        src_attr = ( 'src', 
          '/api/media/type/%(media_type)s/id/%(key_id)s/' % src_binder )
        gap_attr = ( 'gapped', )
        bind_data.append( self.bind_data( 'li' ) )
        bind_data.append( self.bind_data( tag, 
                          [ name_attr, src_attr, gap_attr ] ) ) 
        bind_data.append( self.bind_data( tag, None, None, True ) )
        bind_data.append( self.bind_data( 'li', None, None, True ) )
    bind_data.append( self.bind_data( 'ul', None, None, True ) )
    return bind_data
       
