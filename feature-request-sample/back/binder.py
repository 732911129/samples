import re

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

  def bind_data( self, tag, attrs, next_data, next_select_value ):
    if next_select_value:
      self.next_select_value = next_select_value
    return tag, attrs, next_data

  def bind_type( self, tag, attrs ):
    if tag == 'input':
      if ( 'type', 'radio' ) in attrs:
        return 'radio'
      else:
        return tag
    elif ( 
        tag == 'textarea' or
        tag == 'select' or
        tag == 'option' or
        tag == 'form'
      ):
      return tag
    else:
      return None

  def requested_bind_name( self, attrs ):
    for attr in attrs:
      if attr[ 0 ] == 'name':
        return attr[ 1 ]
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
    bind_name = self.requested_bind_name( attrs )
    if not bind_name:
      return None
    model_can_bind = self.model_can_bind( bind_name, model )
    if not model_can_bind:
      raise TypeError( 'Model can not bind %s' % bind_name )
    else:
      try:        
        return self.__getitem__( 'bind_' + bind_type )( parser, tag, attrs, model, bind_name )
      except:
        raise TypeError( 'Binding of type %s is not implemented' % bind_type ) 

  def bind_input( self, parser, tag, attrs, model, bind_name ):
    model_value = model.getslot( bind_name )
    self.remove_attrs( 'value', attrs )
    attrs.append( ( 'value', model_value ) )
    return self.bind_data( tag, attrs )

  def bind_select( self, parser, tag, attrs, model, bind_name ):
    model_value = model.getslot( bind_name )
    return self.bind_data( tag, attrs, next_select_value = model_value )

  def bind_option( self, parser, tag, attrs, model, bind_name ):
    option_value = parser.get_attribute_value( 'value', attrs )
    if option_value == self.next_select_value:
      attrs.append( ( 'selected' ) )
    return self.bind_data( tag, attrs )

  def bind_textarea( self, parser, tag, attrs, model, bind_name ):
    model_value = model.getslot( bind_name )
    return self.bind_data( tag, attrs, next_data = model_value )

  def bind_radio( self, parser, tag, attrs, model, bind_name ):
    radio_value = parser.get_attribute_value( 'value', attrs )
    model_value = model.getslot( bind_name )
    if radio_value == model_value:
      attrs.append( ( 'checked' ) )
    return self.bind_data( tag, attrs )

  def bind_form( self, parser, tag, attrs, model, bind_name ):
    action_value = parser.get_attribute_value( 'action', attrs )
    model_key_id = model.getslot( 'key_id' )
    transformed_action_value = instance_id_regex.sub( model_key_id, action_value )
    self.remote_attrs( 'action', attrs )
    attrs.append( ( 'action', transformed_action_value ) )
    return self.bind_data( tag, attrs )

